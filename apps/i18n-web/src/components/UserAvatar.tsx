export function UserAvatar(props: { name?: string, avatar?: string }) {
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      {props?.avatar ? (<img src={props?.avatar} alt="avatar" className="w-8 h-8 rounded-full" />) : (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
          <span className="text-sm font-medium">{props.name?.charAt(0)}</span>
        </div>
      )}
    </div>
  )
}