from __future__ import annotations

import shutil
import sys
from pathlib import Path

import csscompressor
import htmlmin
import rjsmin


ROOT = Path.cwd().resolve()
DIST = ROOT / "dist"

IGNORED_DIRS = {
    ".git",
    ".github",
    ".claude",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    "__pycache__",
    "build",
    "dist",
    "env",
    "ENV",
    "htmlcov",
    "logs",
    "node_modules",
    "out",
    "temp",
    "tmp",
    "tools",
    "venv",
    ".venv",
    "xp",
}

IGNORED_FILES = {
    ".coverage",
    ".env",
    ".gitignore",
    "npm-debug.log",
    "server.py",
    "yarn-debug.log",
    "yarn-error.log",
}


def main() -> int:
    reset_dist()
    shutil.copytree(ROOT, DIST, ignore=ignore_local_artifacts)
    minify_static_files(DIST)
    return 0


def reset_dist() -> None:
    dist = DIST.resolve()
    if dist == ROOT or dist.parent != ROOT or dist.name != "dist":
        raise RuntimeError(f"Refusing to remove unsafe dist path: {dist}")

    if dist.exists():
        shutil.rmtree(dist)


def ignore_local_artifacts(directory: str, names: list[str]) -> list[str]:
    ignored: list[str] = []
    for name in names:
        if name in IGNORED_DIRS or name in IGNORED_FILES:
            ignored.append(name)
            continue

        suffix = Path(name).suffix.lower()
        if suffix in {".bak", ".key", ".log", ".orig", ".p12", ".pem", ".pfx", ".tmp"}:
            ignored.append(name)

    return ignored


def minify_static_files(root: Path) -> None:
    for path in root.rglob("*"):
        if not path.is_file():
            continue

        suffix = path.suffix.lower()
        if suffix not in {".css", ".html", ".js"}:
            continue

        original = path.read_text(encoding="utf-8")
        minified = minify_text(original, suffix)
        path.write_text(minified, encoding="utf-8")

        before = len(original.encode("utf-8"))
        after = len(minified.encode("utf-8"))
        print(f"Minificado {path.relative_to(root)}: {before} -> {after} bytes")


def minify_text(text: str, suffix: str) -> str:
    if suffix == ".js":
        return rjsmin.jsmin(text)

    if suffix == ".css":
        return csscompressor.compress(text)

    if suffix == ".html":
        return htmlmin.minify(
            text,
            remove_comments=True,
            remove_empty_space=True,
            reduce_boolean_attributes=True,
        )

    return text


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"Erro ao preparar dist: {exc}", file=sys.stderr)
        raise
