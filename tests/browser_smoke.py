"""Local browser checks. Uses installed Playwright and an existing Edge/Chrome; no downloads."""
import argparse
import json
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--base-url', default='http://127.0.0.1:8766')
args = parser.parse_args()
base_url = args.base_url.rstrip('/')
browser_paths = [
    Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'),
    Path('C:/Program Files/Google/Chrome/Application/chrome.exe'),
]
executable = next((str(path) for path in browser_paths if path.exists()), None)
if executable is None:
    raise SystemExit('No existing Edge or Chrome found. Supply an installed browser; this script never downloads one.')

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=executable, headless=True, args=[
        '--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-first-run',
    ])
    context = browser.new_context(viewport={'width': 1365, 'height': 1000})
    blocked = []
    def local_only(route):
        if route.request.url.startswith(base_url + '/'):
            route.continue_()
        else:
            blocked.append(route.request.url)
            route.abort()
    context.route('**/*', local_only)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(base_url, wait_until='networkidle')
    expect(page.locator('#spinBtn')).to_be_disabled()
    expect(page.locator('#resultDialog')).not_to_be_visible()
    page.locator('#exampleBtn').click()
    expect(page.locator('#itemCount')).to_have_text('5 entries')
    page.locator('#spinBtn').click()
    expect(page.locator('#wordInput')).to_be_disabled()
    expect(page.locator('#resetBtn')).to_be_disabled()
    expect(page.locator('.remove-btn').first).to_be_disabled()
    expect(page.locator('#resultDialog')).to_be_visible(timeout=5000)
    actual_index = page.evaluate('''() => {
        const matrix = new DOMMatrix(getComputedStyle(document.getElementById('wheel')).transform);
        const rotation = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
        return FateSpinnerCore.winnerIndex(rotation, document.querySelectorAll('#itemsList li').length);
    }''')
    assert page.locator('#winnerName').inner_text() == page.locator('.item-label').nth(actual_index).inner_text()
    page.keyboard.press('Escape')
    expect(page.locator('#resultDialog')).not_to_be_visible()
    expect(page.locator('#spinBtn')).to_be_focused()
    page.reload(wait_until='networkidle')
    expect(page.locator('#itemCount')).to_have_text('5 entries')
    page.locator('#resetBtn').click()
    expect(page.locator('#itemCount')).to_have_text('0 entries')
    page.locator('#undoBtn').click()
    expect(page.locator('#itemCount')).to_have_text('5 entries')
    page.locator('#resetBtn').click()
    payload = '<img src=x onerror="window.injected=true">'
    page.locator('#wordInput').fill(f' First \n{payload}\nFirst')
    page.locator('#wordInput').press('Control+Enter')
    expect(page.locator('#itemCount')).to_have_text('3 entries')
    expect(page.locator('.item-label').nth(1)).to_have_text(payload)
    assert page.locator('#itemsList img').count() == 0
    assert page.evaluate('window.injected') is None
    page.locator('#wordInput').fill('x' * 81)
    page.locator('#addWordBtn').click()
    expect(page.locator('#inputError')).to_be_visible()
    expect(page.locator('#wordInput')).to_have_value('x' * 81)
    expect(page.locator('#itemCount')).to_have_text('3 entries')
    page.locator('#wordInput').fill('')
    page.emulate_media(reduced_motion='reduce')
    page.locator('#spinBtn').click()
    expect(page.locator('#resultDialog')).to_be_visible(timeout=1000)
    # Native dialog contains keyboard focus, and repeated spins work without unlocking the page.
    assert page.evaluate('document.getElementById("resultDialog").contains(document.activeElement)')
    page.locator('#spinAgainBtn').click()
    expect(page.locator('#resultDialog')).to_be_visible(timeout=1000)
    page.locator('#removeWinnerBtn').click()
    expect(page.locator('#itemCount')).to_have_text('2 entries')
    expect(page.locator('#resultDialog')).not_to_be_visible()
    page.locator('#resetBtn').click()
    page.locator('#wordInput').fill('\n'.join(f'Choice {i}' for i in range(60)))
    page.locator('#addWordBtn').click()
    expect(page.locator('#itemCount')).to_have_text('60 entries')
    page.locator('#wordInput').fill('Too many')
    page.locator('#addWordBtn').click()
    expect(page.locator('#inputError')).to_contain_text('60 entries')
    page.locator('#wordInput').fill('')
    screenshot_dir = Path(tempfile.gettempdir()) / 'fatespinner-verification'
    screenshot_dir.mkdir(exist_ok=True)
    page.screenshot(path=str(screenshot_dir / 'desktop.png'), full_page=True)
    for width, height in [(375, 812), (320, 700), (812, 375)]:
        page.set_viewport_size({'width': width, 'height': height})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Horizontal overflow at {width}px'
    page.set_viewport_size({'width': 375, 'height': 812})
    page.screenshot(path=str(screenshot_dir / 'mobile.png'), full_page=True)
    page.locator('#spinBtn').click()
    expect(page.locator('#resultDialog')).to_be_visible(timeout=1000)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.locator('#closeResult').click()
    page.locator('#resetBtn').click()
    page.locator('#exampleBtn').click()
    page.set_viewport_size({'width': 1365, 'height': 1000})
    page.screenshot(path=str(screenshot_dir / 'desktop-five.png'), full_page=True)
    page.set_viewport_size({'width': 375, 'height': 812})
    page.screenshot(path=str(screenshot_dir / 'mobile-five.png'), full_page=True)
    assert not errors, errors
    assert not blocked, f'Unexpected external requests: {blocked}'
    context.close()

    # A blocked storage policy must not stop wheel initialization or choice management.
    private_context = browser.new_context(reduced_motion='reduce')
    private_context.route('**/*', local_only)
    private_context.add_init_script('''
        Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
        Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
    ''')
    private_page = private_context.new_page()
    private_page.on('pageerror', lambda error: errors.append(str(error)))
    private_page.goto(base_url, wait_until='networkidle')
    expect(private_page.locator('#saveNotice')).to_contain_text('unavailable')
    private_page.locator('#exampleBtn').click()
    private_page.locator('#spinBtn').click()
    expect(private_page.locator('#resultDialog')).to_be_visible(timeout=1000)
    assert not errors, errors
    assert not blocked, blocked
    private_context.close()
    browser.close()
    print(json.dumps({'result': 'PASS', 'checks': ['spin/pointer alignment', 'locked spin controls', 'persistence', 'undo clear', 'literal HTML input', 'bulk keyboard input', 'validation limits', 'reduced motion', 'dialog focus/Escape', 'remove winner', '320/375px and landscape layout', 'blocked storage', 'no external requests or page errors'], 'screenshots': str(screenshot_dir)}))
