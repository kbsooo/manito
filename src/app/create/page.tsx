'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

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
    return <div className="text-center mt-10">Loading...</div>
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
      // 세션에서 사용자 ID 추출 (Kakao의 sub 값을 userId로 사용)
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
          // Kakao sub를 userId로 사용 (token.sub)
          userId: session.user.id || session.user.email || 'unknown',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create group')
      }

      // 성공 시 그룹 목록 페이지로 이동
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

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Create New Group</h1>

      {/* 현재 로그인한 사용자 정보 표시 */}
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600">
          Logged in as: {session?.user?.name || 'Unknown User'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Group Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={groupData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password (Optional)
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={groupData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !groupData.name}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${loading || !groupData.name 
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  )
}