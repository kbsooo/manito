// app/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/app/components/Header'
import LoadingScreen from '@/app/components/LoadingScreen'
import './style.css'

export default function CreateGroupPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [groupData, setGroupData] = useState({
    name: '',
    password: '',
  })
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // 인증되지 않은 사용자 처리
  if (status === "loading") {
    return <LoadingScreen message="사용자 정보를 확인하는 중입니다" />;
  }

  if (status === "unauthenticated") {
    router.push('/auth/signin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!session?.user) {
        throw new Error('User session not found')
      }

      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...groupData,
          userId: session.user.id || session.user.email || 'unknown',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create group')
      }

      router.push('/main')
      router.refresh()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGroupData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 폼 제출 중일 때도 로딩 화면 표시
  if (loading) {
    return <LoadingScreen message="새로운 그룹을 만드는 중입니다" />;
  }

  return (
    <div className="pageContainer">
      <Header />
      <main className="mainContent">
        <div className="formCard">
          <h1 className="formTitle">새 그룹 만들기</h1>
          
          <div className="userInfo">
            <span className="userName">{session?.user?.name || 'Unknown User'}</span>
            <span className="userSubtext">님의 새로운 마니또 그룹</span>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <div className="inputGroup">
              <label htmlFor="name" className="inputLabel">
                그룹 이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={groupData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="그룹 이름을 입력해주세요"
              />
            </div>

            <div className="inputGroup">
              <label htmlFor="password" className="inputLabel">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={groupData.password}
                onChange={handleChange}
                className="input"
                placeholder="비밀번호를 설정하세요"
              />
            </div>

            {error && (
              <div className="errorMessage">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!groupData.name}
              className={`submitButton ${!groupData.name ? 'disabled' : ''}`}
            >
              그룹 만들기
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}