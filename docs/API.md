# API ドキュメント

このドキュメントは `src/app/api` 以下に実装された主要 API エンドポイントの概要です。

## TypeSpec について

- API 仕様の正本は `specs/typespec/main.tsp` とします。
- OpenAPI 生成は `specs/typespec` で `npx tsp compile main.tsp` を実行してください。
- 生成物は `specs/typespec/tsp-output/schema/` に出力されます。
- 実装変更時は TypeSpec も同時に更新してください。

注意: すべてのレスポンスは `src/lib/response.ts` の `apiResponse` を通して返され、成功時は `{ success: true, message, data }`、失敗時は `{ success: false, error }` 形式です。

## 認証

- 認証機能は `better-auth` を使用し、`src/app/api/auth/[...all]/route.ts` でハンドルされています。
- セッション取得は `src/lib/middleware.ts` の `withAuth` を通じて行います。認証が必要なエンドポイントはセッションが必須です。

## /api/tickets

- メソッド: `GET`
- 概要: クエリパラメータ `number` を指定してチケットを検索します。
- クエリ: `?number=<ticket-number>` が必須。
- 認証: `withAuth` を利用（セッションが必要）
- 成功: チケットオブジェクトを返します。

例:

GET /api/tickets?number=2026-0001

## /api/tickets/[id]

- メソッド: `GET`, `PUT`
- 説明: 指定した `id` のチケットを取得・更新します。
- `GET`:
  - 認証必須: `withAuth` によりセッションが必要
  - 追加制約: ユーザーのメールが `@sandagakuen.ed.jp` で終わることを検証（管理者向けアクセス制御）
  - 成功: チケットオブジェクト

- `PUT`:
  - 認証必須かつメールドメイン制約あり
  - リクエスト JSON: `{ "status": "OPEN|ENTERED|CALLING|CALLED|CLOSED|..." }`（`TicketStatus` 型に準拠）
  - 更新ロジック:
    - ステータス遷移に応じて `index`／`closedAt` を更新するため、データベーストランザクション内で集計・更新を実行
    - `CALLED` -> `OPEN` のように戻す場合、同一 `prefix` の最大 `index` を求め `index = max + 1` を設定
    - `ENTERED` へ遷移する場合も同様に `index` を割り当てる
    - `CLOSED` へ遷移する場合は `closedAt` を設定

## /api/tickets/monitor

- メソッド: `GET`
- クエリ: `?stage=<prefix>` が必須
- 概要: 指定したステージ（`prefix`）のモニター用情報を返します。
- レスポンス: `{ open: [...], meeting: [...], skipped: [...] }` の形式で返却。各配列は限定フィールドのみを返します（`id, num, status, index, createdAt, updatedAt` など）。

## /api/tickets/stages

- メソッド: `GET`
- 概要: データベース内の distinct な `prefix` 値（ステージ一覧）を返します。

## /api/auth/[...all]

- `better-auth` の Next.js ハンドラにより `POST` / `GET` 等が実装されています。
- ソーシャルログイン（Google）やセッション取得・サインアウトなどのエンドポイントが含まれます。設定は `src/lib/auth.ts` を参照してください（`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` が必須）。

---
補足: ここに載せたのは主要な API の要約です。より細かいリクエスト／レスポンスの型は `src/generated/prisma` の型定義と各ルート実装を参照してください。
