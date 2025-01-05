'use client'

import { useMountedState } from 'react-use'

const ModalProvider = () => {
  const isMounted = useMountedState()

  if (!isMounted) return null

  return <></>
}

export default ModalProvider
