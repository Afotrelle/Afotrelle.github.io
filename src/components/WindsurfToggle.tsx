const STORAGE_KEY = 'arturo-windsurf-mode';

const normalRouteMap: Record<string, string> = {
  '/windsurfing': '/',
  '/windsurfing/sessions': '/projects',
  '/windsurfing/contact': '/contact',
};

type WindsurfToggleProps = {
  label?: string;
};

export default function WindsurfToggle({ label }: WindsurfToggleProps) {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const localePrefix = currentPath === '/it' || currentPath.startsWith('/it/') ? '/it' : '';
  const localizedCurrentPath = localePrefix ? currentPath.slice(localePrefix.length) || '/' : currentPath;
  const localizedEnabled = localizedCurrentPath === '/windsurfing' || localizedCurrentPath.startsWith('/windsurfing/');
  const action = localePrefix
    ? localizedEnabled
      ? { label: 'Disattiva modalità windsurf', title: 'Torna alla modalità standard' }
      : { label: 'Attiva modalità windsurf', title: 'Attiva la modalità windsurf' }
    : localizedEnabled
      ? { label: 'Disable Windsurfing mode', title: 'Back to normal mode' }
      : { label: 'Enable Windsurfing mode', title: 'Activate Windsurfing mode' };

  return (
    <button
      type="button"
      className="lang-toggle"
      aria-label={action.label}
      aria-pressed={localizedEnabled}
      title={action.title}
      onClick={() => {
        const nextPath = localizedEnabled
          ? `${localePrefix}${normalRouteMap[localizedCurrentPath] ?? '/'}`
          : `${localePrefix}/windsurfing`;
        window.localStorage.setItem(STORAGE_KEY, String(!localizedEnabled));
        window.location.assign(nextPath);
      }}
    >
      {label ?? ''}
    </button>
  );
}
