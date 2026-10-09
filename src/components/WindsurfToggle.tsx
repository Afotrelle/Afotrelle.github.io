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
  const enabled = currentPath === '/windsurfing' || currentPath.startsWith('/windsurfing/');

  return (
    <button
      type="button"
      className="lang-toggle"
      aria-label={enabled ? 'Disable Windsurfing Instructor mode' : 'Enable Windsurfing Instructor mode'}
      aria-pressed={enabled}
      title={enabled ? 'Back to normal mode' : 'Activate Windsurfing Instructor mode'}
      onClick={() => {
        const nextPath = enabled ? normalRouteMap[currentPath] ?? '/' : '/windsurfing';
        window.localStorage.setItem(STORAGE_KEY, String(!enabled));
        window.location.assign(nextPath);
      }}
    >
      {label ?? ''}
    </button>
  );
}
