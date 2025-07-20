import { BrowserRouter, Route, Routes } from 'react-router'

import { AuthenticatedLayout } from './layouts/authenticated'
import { ROUTES } from './lib/constants'
import { ChatDetailPage } from './pages/chat-detail'
import { LoginPage } from './pages/login'
import { NewPage } from './pages/new'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route element={<AuthenticatedLayout />}>
          <Route path={ROUTES.new} element={<NewPage />} />
          <Route path={ROUTES.chatDetail} element={<ChatDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
