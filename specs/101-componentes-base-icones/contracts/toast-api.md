# Contract: Toast API

```ts
toast.success(message: string): void
toast.error(message: string): void
toast.info(message: string): void
```

Requires `<ToastProvider>` wrapping the app. Renders in a portal; `aria-live="polite"` (error MAY be assertive). Auto-dismiss ~4s.
