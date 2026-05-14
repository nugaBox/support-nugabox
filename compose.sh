#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# .env 로드 (있으면)
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  set -a && source .env && set +a
fi

COMPOSE_BASE=(docker compose -f docker-compose.yml)

_dev_compose() {
  docker compose -f docker-compose.yml -f docker-compose.dev.yml "$@"
}

_prod_compose() {
  docker compose -f docker-compose.yml -f docker-compose.prod.yml "$@"
}

# ./compose.sh --dev up 형태 호환
case "${1:-}" in
  --dev) set -- dev "${@:2}" ;;
  --prod) set -- prod "${@:2}" ;;
esac

cmd="${1:-}"
sub="${2:-}"

case "$cmd" in
  dev)
    shift || true
    subcmd="${1:-}"
    shift || true
    case "$subcmd" in
      up)
        _dev_compose up -d --build "$@"
        ;;
      down)
        _dev_compose down "$@"
        ;;
      logs)
        _dev_compose logs -f "${@:-}"
        ;;
      migrate)
        _dev_compose exec backend sh -lc 'npx prisma migrate deploy && npx prisma generate'
        ;;
      seed)
        _dev_compose exec backend sh -lc 'npx prisma generate && npx prisma db seed'
        ;;
      *)
        echo "사용법: $0 dev {up|down|logs|migrate|seed}"
        exit 1
        ;;
    esac
    ;;
  prod)
    shift || true
    subcmd="${1:-}"
    shift || true
    case "$subcmd" in
      up)
        _prod_compose up -d --build "$@"
        ;;
      down)
        _prod_compose down "$@"
        ;;
      logs)
        _prod_compose logs -f "${@:-}"
        ;;
      migrate)
        _prod_compose exec backend sh -lc 'npx prisma migrate deploy && npx prisma generate'
        ;;
      *)
        echo "사용법: $0 prod {up|down|logs|migrate}"
        exit 1
        ;;
    esac
    ;;
  *)
    echo "NUGABOX Support — Docker Compose 래퍼"
    echo ""
    echo "개발 (동일: $0 --dev …):"
    echo "  $0 dev up          # 빌드 후 백그라운드 기동 (hot reload)"
    echo "  $0 dev down"
    echo "  $0 dev logs"
    echo "  $0 dev migrate     # Prisma migrate deploy"
    echo "  $0 dev seed        # 시드 실행"
    echo ""
    echo "운영:"
    echo "  $0 prod up"
    echo "  $0 prod down"
    echo "  $0 prod logs"
    echo "  $0 prod migrate"
    exit 1
    ;;
esac
