import App from './App.svelte'

// 确保 DOM 加载完成
const app = new App({
  target: document.getElementById('app')!,
})

// 全局错误处理
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
  })
}

export default app
