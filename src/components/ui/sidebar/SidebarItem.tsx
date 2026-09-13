import { NavLink } from 'react-router'
import { type SidebarLink } from './Sidebar'

type SidebarItemProps =SidebarLink

const SidebarItem =({iconEl,name,href}:SidebarItemProps) => {
  const Icon=iconEl||"svg"
  return (
       <NavLink
            to={href}
            className={({isActive})=>`flex items-center gap-2.5  py-3.5 px-4.25  rounded-[17px] transition-all duration-200 ${isActive?"text-neutral-900 bg-primary":"text-neutral-400 hover:bg-[rgba(255,255,255,0.05)] hover:text-neutral-300"}`}
          >
            {Icon?<Icon width={20} height={20} />:null}
            <p className="text-[15px]">{name}</p>
          </NavLink>
  )
}

export default SidebarItem