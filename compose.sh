#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  set -a && source .env && set +a
fi

_dev_compose() {
  docker compose -f docker-compose.yml -f docker-compose.dev.yml "$@"
}

_prod_compose() {
  docker compose -f docker-compose.yml -f docker-compose.prod.yml "$@"
}

mode="${1:-}"
case "$mode" in
  --dev|--prod) ;;
  *)
    cat <<'EOF'
NUGABOX Support — Docker Compose 래퍼

개발:
  ./compose.sh --dev up         # 빌드 후 백그라운드 기동 (hot reload)
  ./compose.sh --dev down
  ./compose.sh --dev logs [서비스명…]
  ./compose.sh --dev migrate    # Prisma migrate deploy
  ./compose.sh --dev seed       # 시드 실행

운영:
  ./compose.sh --prod up
  ./compose.sh --prod down
  ./compose.sh --prod logs [서비스명…]
  ./compose.sh --prod migrate
EOF
    exit 1
    ;;
esac

shift
if [[ $# -lt 1 ]]; then
  echo "하위 명령이 필요합니다 (예: $mode up)."
  exit 1
fi
subcmd="${1}"
shift

case "$mode" in
  --dev)
    case "$subcmd" in
      up) _dev_compose up -d --build "$@" ;;
      down) _dev_compose down "$@" ;;
      logs) _dev_compose logs -f "${@:-}" ;;
      migrate) _dev_compose exec backend sh -lc 'npx prisma migrate deploy && npx prisma generate' ;;
      seed) _dev_compose exec backend sh -lc 'npx prisma generate && npx prisma db seed' ;;
      *)
        echo "알 수 없는 명령: $subcmd"
        echo "사용법: $0 --dev {up|down|logs|migrate|seed}"
        exit 1
        ;;
    esac
    ;;
  --prod)
    case "$subcmd" in
      up) _prod_compose up -d --build "$@" ;;
      down) _prod_compose down "$@" ;;
      logs) _prod_compose logs -f "${@:-}" ;;
      migrate) _prod_compose exec backend sh -lc 'npx prisma migrate deploy && npx prisma generate' ;;
      *)
        echo "알 수 없는 명령: $subcmd"
        echo "사용법: $0 --prod {up|down|logs|migrate}"
        exit 1
        ;;
    esac
    ;;
esac
