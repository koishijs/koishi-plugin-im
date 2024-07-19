import { useStorage } from '@cordisjs/client'
import { ImTypes } from '@satorijs/plugin-im'

interface SharedConfig {
  shouldLogin: boolean
  currentUser: ImTypes.User | null
}

const shared = useStorage<SharedConfig>('im', 1, () => ({
  shouldLogin: true,
  currentUser: null,
}))

export default shared
