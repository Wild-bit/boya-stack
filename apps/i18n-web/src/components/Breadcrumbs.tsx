import { Fragment } from 'react';
import { useMatches } from 'react-router-dom';
import { IconSvg } from './IconSvg';

interface RouteHandle {
  breadcrumb?: () => React.ReactNode;
}

export function Breadcrumbs() {
  const matches = useMatches();
  const crumbs = matches.filter(
    (match) => (match.handle as RouteHandle)?.breadcrumb
  );

  return (
    <nav className="flex items-center gap-2">
      {crumbs.map((match, index) => (
        <Fragment key={match.id}>
          {index > 0 && (
            <IconSvg name="breadcrumb-split" size={16} className="text-gray-300" />
          )}
          {(match.handle as RouteHandle).breadcrumb!()}
        </Fragment>
      ))}
    </nav>
  );
}
