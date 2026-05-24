# UniSchool Ticket Service

## 概要

`ticket_service` は UniSchool 向けのチケット管理サービスのフロントエンド／API を含む Next.js (App Router) プロジェクトです。主な機能はチケット作成・参照・監視・ステージ管理および認証連携です。バックエンドのデータアクセスには Prisma を使用しています。

## 技術スタック

- フレームワーク: Next.js (App Router)
- 言語: TypeScript
- ORM: Prisma
- データベース: (Prisma 経由で接続する任意の RDBMS)
- その他: Sonner（通知）、Google OAuth（認証用アイコンが存在）、Cloud Functions スクリプト（`scripts/forms.gs.js`）など

## 事前準備

- Node.js（推奨 LTS）とパッケージマネージャ（npm / pnpm / yarn）
- データベース（Postgres 等）を用意し、接続文字列を取得
- `prisma` CLI をローカルにインストールしておくと便利です

## 環境変数

プロジェクトの実行に必要な主な環境変数（例）：

- `DATABASE_URL` - Prisma が使用するデータベース接続文字列
- `NEXTAUTH_URL` - アプリのベース URL
- `NEXT_PUBLIC_*` - クライアントから参照する公開変数

（詳しい環境変数は `src/lib/auth.ts` や `src/lib/prisma.ts` などのソースを参照してください）

## インストール

```bash
# リポジトリをクローン
git clone <repo-url>
cd ticket_service

# 依存関係をインストール
npm install
# または
pnpm install
```

## データベースと Prisma

1. `prisma/schema.prisma` を確認し、`DATABASE_URL` を設定します。
2. マイグレーションを適用します。

```bash
npx prisma migrate deploy
# 開発環境でマイグレーションを作成する場合:
npx prisma migrate dev --name init
```

生成コード（`src/generated/prisma`）は既にコミットされていますが、必要に応じて `npx prisma generate` を実行してください。

## 開発サーバーの起動

```bash
npm run dev
# デフォルト: http://localhost:3000
```

API ルートは `src/app/api` 以下にあります。認証周りは `src/app/api/auth/[...all]/route.ts`、チケット API は `src/app/api/tickets/route.ts` とそのサブパスにあります。

## プロジェクト構成（主要フォルダ）

- `src/app` - Next.js の App Router 構成（ページ・API）
- `src/components` - UI / フォーム・レイアウトコンポーネント
- `src/lib` - アプリで共有するユーティリティ（`prisma.ts`, `auth.ts` 等）
- `prisma` - Prisma スキーマとマイグレーション
- `scripts` - 補助スクリプト（例: `forms.gs.js`）

より詳細なファイル位置はリポジトリを参照してください。

## よく使うコマンド

- `npm run dev` — 開発サーバーを起動
- `npm run build` — 本番ビルド
- `npm start` — 本番モードで起動
- `npx prisma migrate dev` — ローカルでマイグレーション作成
- `npx prisma migrate deploy` — 本番へマイグレーション適用

## デプロイ

Vercel などのプラットフォームにデプロイ可能です。デプロイ時に `DATABASE_URL` 等の環境変数を設定してください。

## 貢献

1. フォークしてブランチを作成
2. 変更をコミット
3. プルリクエストを送る

必要に応じて、テストや追加のドキュメントを含めてください。

## 問い合わせ

不明点があればこのリポジトリの Issues を作成してください。
