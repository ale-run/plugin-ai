const colors = [
  {
    color: 'primary',
    bg: 'bg-primary',
    fg: 'text-white'
  },
  {
    color: 'info',
    bg: 'bg-info',
    fg: 'text-white'
  },
  {
    color: 'success',
    bg: 'bg-success',
    fg: 'text-white'
  },
  {
    color: 'warning',
    bg: 'bg-warning',
    fg: 'text-white'
  },
  {
    color: 'danger',
    bg: 'bg-danger',
    fg: 'text-white'
  },
  {
    color: 'system',
    bg: 'bg-system',
    fg: 'text-white'
  },
  {
    color: 'black',
    bg: 'bg-black',
    fg: 'text-white'
  },
  {
    color: 'amber-500',
    bg: 'bg-amber-500',
    fg: 'text-white'
  },
  {
    color: 'orange-500',
    bg: 'bg-orange-500',
    fg: 'text-white'
  },
  {
    color: 'indigo-500',
    bg: 'bg-indigo-500',
    fg: 'text-white'
  }
];

export default (text: string): { color: string; fg: string; bg: string } => {
  if (['dev', 'devel', 'development'].includes(text)) return colors.find((c) => c.color === 'black');
  if (['main', 'prod', 'production'].includes(text)) return colors.find((c) => c.color === 'info');
  if (['qa', 'stg', 'stage', 'staging'].includes(text)) return colors.find((c) => c.color === 'system');
  const str = text?.charCodeAt(0) + (text?.charCodeAt(1) || 0) + (text?.charCodeAt(text?.length - 1) || 0) + text?.length;
  return str && colors[str % colors.length];
};
