import { icons, IconSquareCheck } from '@cordisjs/client'
import AddSquare from './add-square.vue'
import Ban from './ban.vue'
import Bell from './bell.vue'
import Bookmark from './bookmark.vue'
import Blank from './emoji/blank.vue'
import Check from './check.vue'
import Close from './close.vue'
import CircleCheck from './circle-check.vue'
import Copy from './copy.vue'
import Edit from './edit.vue'
import EllipsisV from './ellipsis-v.vue'
import Envelope from './envelope.vue'
import Folder from './folder.vue'
import Group from './group.vue'
import Image from './image.vue'
import Inbox from './inbox.vue'
import Chat from './chat.vue'
import Message from './message.vue'
import Minus from './minus.vue'
import SmileWink from './emoji/smile-wink.vue'
import Pin from './pin.vue'
import Quote from './quote.vue'
import Recall from './recall.vue'
import Refresh from './refresh.vue'
import SettingsGear from './settings-gear.vue'
import SettingsSlider from './settings-slider.vue'
import Settings from './settings.vue'
import Share from './share.vue'
import TrashCan from './trash-can.vue'

import TextChannel from './channel/text.vue'

import Bold from './editor/bold.vue'
import Italic from './editor/italic.vue'

icons.register('im:add-square', AddSquare)
icons.register('im:ban', Ban)
icons.register('im:bell', Bell)
icons.register('im:bookmark', Bookmark)
icons.register('im:chat', Chat)
icons.register('im:check', Check)
icons.register('im:check-round', CircleCheck)
icons.register('im:close', Close)
icons.register('im:copy', Copy)
icons.register('im:edit', Edit)
icons.register('im:ellipsis-vertical', EllipsisV)
icons.register('im:envelope', Envelope)
icons.register('im:folder', Folder)
icons.register('im:group', Group)
icons.register('im:image', Image)
icons.register('im:inbox', Inbox)
icons.register('im:message', Message)
icons.register('im:minus', Minus)
icons.register('im:pin', Pin)
icons.register('im:quote', Quote)
icons.register('im:readed', IconSquareCheck)
icons.register('im:recall', Recall)
icons.register('im:refresh', Refresh)
icons.register('im:settings', Settings)
icons.register('im:settings-gear', SettingsGear)
icons.register('im:settings-slider', SettingsSlider)
icons.register('im:share', Share)
icons.register('im:trash-can', TrashCan)

icons.register('im:text-channel', TextChannel)

// emoji
icons.register('im:emoji', SmileWink)
icons.register('im:personnel', Blank)

// editor
icons.register('editor:bold', Bold)
icons.register('editor:italic', Italic)
