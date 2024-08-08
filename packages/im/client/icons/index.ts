import { icons, IconSquareCheck } from '@cordisjs/client'
import Ban from './ban.vue'
import Bell from './bell.vue'
import CircleCheck from './circle-check.vue'
import Copy from './copy.vue'
import Edit from './edit.vue'
import Envelope from './envelope.vue'
import Group from './group.vue'
import Image from './image.vue'
import Chat from './chat.vue'
import Minus from './minus.vue'
import SmileWink from './smile-wink.vue'
import Pin from './pin.vue'
import Quote from './quote.vue'
import Recall from './recall.vue'
import Refresh from './refresh.vue'
import Setting from './setting.vue'
import Share from './share.vue'
import TrashCan from './trash-can.vue'

import TextChannel from './channel/text.vue'

import Bold from './editor/bold.vue'
import Italic from './editor/italic.vue'

icons.register('im:ban', Ban)
icons.register('im:bell', Bell)
icons.register('im:chat', Chat)
icons.register('im:checked', CircleCheck)
icons.register('im:copy', Copy)
icons.register('im:edit', Edit)
icons.register('im:envelope', Envelope)
icons.register('im:emoji', SmileWink)
icons.register('im:group', Group)
icons.register('im:image', Image)
icons.register('im:minus', Minus)
icons.register('im:pin', Pin)
icons.register('im:quote', Quote)
icons.register('im:readed', IconSquareCheck)
icons.register('im:recall', Recall)
icons.register('im:refresh', Refresh)
icons.register('im:setting', Setting)
icons.register('im:share', Share)
icons.register('im:trash-can', TrashCan)

icons.register('im:text-channel', TextChannel)

// editor
icons.register('editor:bold', Bold)
icons.register('editor:italic', Italic)
