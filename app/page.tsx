'use client'

import React, { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    window.location.href = 'http://localhost:3000/auth/login'
  }, [])

  return <div>Hello!</div>
}
