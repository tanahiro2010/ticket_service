# コードベース概要

このドキュメントはリポジトリの主要構成と、開発・デバッグ時に参照すべきファイルのガイドです。

## 主要フォルダ

- `src/app` - Next.js App Router によるページと API。`src/app/api` に API ルートがある。
- `src/components` - UI コンポーネント（フォーム、レイアウト、ボタンなど）。
- `src/lib` - 共通ユーティリティ（`prisma.ts`, `auth.ts`, `middleware.ts`, `response.ts` 等）。
- `prisma` - Prisma スキーマとマイグレーション。データモデルを変更する場合はこちらを編集。
- `src/generated/prisma` - Prisma の生成クライアントと型。手動編集しない。

## 重要なファイル

- `src/lib/prisma.ts` - PrismaClient の初期化。`DATABASE_URL` が必須。
- `src/lib/auth.ts` - `better-auth` の設定（ソーシャルプロバイダ設定やシークレット）。環境変数 `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` が必要。
- `src/lib/middleware.ts` - `withAuth` ヘルパー。API ハンドラでセッションを取得して認可を行う。
- `src/lib/response.ts` - API の標準レスポンスフォーマットを提供するユーティリティ。
- `src/app/api` - ルート実装（例: `tickets`, `auth`）。API ドキュメントは `docs/API.md` を参照。

## 認証とアクセス制御

- 認証は `better-auth` ベースで実装されています。`auth.api.getSession({ headers: req.headers })` でセッションを取得します。
- 管理者アクセスの簡易チェックはメールドメイン（`@sandagakuen.ed.jp`）で行われています（`src/app/api/tickets/[id]/route.ts` など）。

## データモデル

- Prisma スキーマは `prisma/schema.prisma` にあります。モデルの型情報は `src/generated/prisma/models` と `client.ts` で確認できます。

## 開発時の流れ

1. 環境変数を設定（`DATABASE_URL` など）
2. 依存関係をインストール: `npm install` / `pnpm install`
3. マイグレーションを適用（開発）: `npx prisma migrate dev --name <name>`
4. 開発サーバを起動: `npm run dev`

## 注意点 / 推奨

- 生成された Prisma クライアント (`src/generated/prisma`) はソースに含まれているため、`prisma generate` を頻繁に走らせる必要はありませんが、スキーマを更新した場合は再生成してください。
- `prisma` 周りのトランザクションロジックは `src/app/api/tickets/[id]/route.ts` のように扱われているため、同じパターンを踏襲して整合性を保つと良いです。

---
追加で欲しいドキュメント（例: 環境変数の完全リスト、エンドツーエンドの起動手順、API のサンプルリクエスト/レスポンス等）があれば教えてください。必要に応じて `docs` に追記します。
