interface IconSvgProps extends React.SVGAttributes<SVGSVGElement> {
  name: string;
  size?: number | string;
}

export function IconSvg({ name, size, width, height, ...rest }: IconSvgProps) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <svg width={w} height={h} {...rest}>
      <use href={`/images/sprite.svg#icon-${name}`} />
    </svg>
  );
}
