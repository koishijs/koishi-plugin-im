import { Dict, useStorage } from '@cordisjs/client'
import type Window from '../components/scene'

interface SharedConfig {
  token: string
}

const shared = useStorage<SharedConfig>('im', 1, () => ({
  token: '',
}))

export default shared
