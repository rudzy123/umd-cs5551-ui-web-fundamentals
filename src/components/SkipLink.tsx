export function SkipLink() {
  return (
    <a
      className="skip-link"
      href="#main-content"
      onClick={(event) => {
        const main = document.getElementById('main-content');
        if (!main) return;
        event.preventDefault();
        main.focus();
      }}
    >
      Skip to main content
    </a>
  );
}
