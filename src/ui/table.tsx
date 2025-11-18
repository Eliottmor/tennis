import clsx from 'clsx'
import React, { createContext, type ReactNode, useContext, useRef, useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useRemainingHeight } from '~/hooks/use-remaining-height'
import { ArrowDownIcon, ArrowUpIcon } from '~/components/icons'

export interface TableCell<T> {
  renderCell: (prop: T) => ReactNode
  headerLabel: string
  className?: string
  sortKey?: keyof T
  mobileVisibility?: 'always' | 'sm' | 'lg' | 'never'
  mobileLabel?: string
}

interface TableProps<T> {
  cells: TableCell<T>[]
  rows: T[]
  isLoading?: boolean
  skeletonRowCount?: number
  zeroStateContent?: ReactNode
  striped?: boolean
  bleed?: boolean
  dense?: boolean
  onClick?: (cell: T) => void
  isContentHeight?: boolean
}

interface SkeletonRow {
  id: string
  isSkeleton: boolean
}

const getSkeletonRows = (count: number) => {
  const bones: SkeletonRow[] = []
  for (let index = count; index > 0; index--) {
    bones.push({ id: `skeleton-${index}`, isSkeleton: true })
  }
  return bones
}

export function Table<T>({
  cells,
  rows,
  isLoading,
  skeletonRowCount = 5,
  zeroStateContent,
  striped,
  bleed,
  dense,
  onClick,
  isContentHeight
}: TableProps<T>) {
  const [sortBy, setSortBy] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null)
  
  const handleSort = (key: keyof T, direction: 'asc' | 'desc' | null) => {
    setSortBy(key)
    setSortDirection(direction)
  }

  const sortedRows = useMemo(() => {
    if (!rows || !sortBy || !sortDirection) return rows

    return [...rows].sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === 'asc' 
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime()
      }
      
      return 0
    })
  }, [rows, sortBy, sortDirection])

  const skeletonRows = getSkeletonRows(skeletonRowCount)
  const tableRows = isLoading ? skeletonRows : sortedRows

  // Find the first column that's always visible (for mobile stacking)
  const firstVisibleColumnIndex = cells.findIndex(cell => (cell.mobileVisibility ?? 'always') === 'always')
  const firstColumnIndex = firstVisibleColumnIndex >= 0 ? firstVisibleColumnIndex : 0

  // Collect columns that should stack on mobile (not always visible and not never)
  const mobileStackColumns = cells
    .map((cell, index) => ({ cell, index }))
    .filter(({ cell }) => {
      const visibility = cell.mobileVisibility ?? 'always'
      return visibility !== 'always' && visibility !== 'never'
    })

  return (
    <>
      <ComposableTable striped={striped} dense={dense} bleed={bleed} rows={rows} isLoading={isLoading} isContentHeight={isContentHeight} sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort}>
        <ComposableTableHead>
          <ComposableTableRow>
            {cells.map((cell: TableCell<T>, i: number) => (
              <ComposableTableHeader 
                className={cell.className} 
                key={`table-header-${i}`} 
                sortKey={cell.sortKey}
                mobileVisibility={cell.mobileVisibility ?? 'always'}
                isFirstHeader={i === firstColumnIndex}
              >
                {cell.headerLabel} 
              </ComposableTableHeader>
            ))}
          </ComposableTableRow>
        </ComposableTableHead>
        <ComposableTableBody>
          {tableRows && tableRows.map((row, index: number) => (
            <ComposableTableRow
              key={`table-row-${index}`}
              className={clsx(!!onClick && 'cursor-pointer')}
              hasOnClick={!!onClick}
              onClick={() => {
                if (!isSkeletonRow(row) && onClick) {
                  onClick(row)
                }
              }}
            >
              {cells.map((cell: TableCell<T>, cellIndex: number) => {
                const isFirstCell = cellIndex === firstColumnIndex
                const mobileVisibility = cell.mobileVisibility ?? 'always'
                const { renderCell, className: cellClassName } = cell
                
                // For the first cell, include mobile stacking content
                const cellContent = isSkeletonRow(row) ? (
                  <SkeletonCell />
                ) : (
                  <>
                    {renderCell(row)}
                    {isFirstCell && mobileStackColumns.length > 0 && (
                      <dl className="font-normal lg:hidden">
                        {mobileStackColumns.map(({ cell: stackCell, index: stackIndex }) => {
                          const stackVisibility = stackCell.mobileVisibility ?? 'always'
                          const stackLabel = stackCell.mobileLabel || stackCell.headerLabel
                          
                          // Determine which breakpoint to hide at based on visibility
                          // If visibility is 'lg', show in dl (no additional class needed since dl is lg:hidden)
                          // If visibility is 'sm', hide at sm (show only on mobile)
                          const hideAtBreakpoint = stackVisibility === 'sm' ? 'sm:hidden' : ''
                          
                          return (
                            <React.Fragment key={`mobile-stack-${stackIndex}`}>
                              <dt className={clsx('sr-only', hideAtBreakpoint)}>{stackLabel}</dt>
                              <dd className={clsx('mt-1 truncate text-gray-700 dark:text-gray-300', hideAtBreakpoint)}>
                                {stackCell.renderCell(row)}
                              </dd>
                            </React.Fragment>
                          )
                        })}
                      </dl>
                    )}
                  </>
                )

                return (
                  <ComposableTableCell 
                    key={`table-cell-${cellIndex}`} 
                    className={cellClassName}
                    mobileVisibility={mobileVisibility}
                    isFirstCell={isFirstCell}
                  >
                    {cellContent}
                  </ComposableTableCell>
                )
              })}
            </ComposableTableRow>
          ))}
        </ComposableTableBody>
      </ComposableTable>
      {rows?.length === 0 && !isLoading && zeroStateContent}
    </>
  )
}

export default Table

function isSkeletonRow(row: unknown): row is SkeletonRow {
  return (row as SkeletonRow).isSkeleton === true
}

const SkeletonCell: React.FC = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-800 h-5 my-2 w-3/4 rounded"></div>
)

const TableContext = createContext<{ 
  bleed: boolean; 
  dense: boolean; 
  grid: boolean; 
  striped: boolean;
  sortBy?: any;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: (key: any, direction: 'asc' | 'desc' | null) => void;
}>({
  bleed: false,
  dense: false,
  grid: false,
  striped: false
})

export function ComposableTable({
  bleed = false,
  dense = false,
  grid = false,
  striped = false,
  className,
  children,
  rows,
  isLoading,
  isContentHeight,
  sortBy,
  sortDirection,
  onSort,
  ...props
}: { 
  bleed?: boolean; 
  dense?: boolean; 
  grid?: boolean; 
  striped?: boolean; 
  rows?: any[]; 
  isLoading?: boolean; 
  isContentHeight?: boolean;
  sortBy?: any;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: (key: any, direction: 'asc' | 'desc' | null) => void;
} & React.ComponentPropsWithoutRef<'div'>) {
  const componentRef = useRef<HTMLDivElement>(null);
  const { remainingHeight } = useRemainingHeight(componentRef as React.RefObject<HTMLElement>);
  const hasRows = rows && rows.length > 0;
  const height = isLoading || hasRows ? (remainingHeight >= 500 ? remainingHeight : 500) : 50
  
  return (
    <TableContext.Provider value={{ bleed, dense, grid, striped, sortBy, sortDirection, onSort } as React.ContextType<typeof TableContext>}>
      <div className="flow-root">
        <div ref={componentRef} {...props} style={{ height: isContentHeight ? 'auto' : height }} className={clsx(className, '-mx-4 sm:mx-0 whitespace-nowrap overflow-x-auto')}>
          <div className={clsx('inline-block w-32 sm:min-w-full align-middle', !bleed && 'sm:px-[--gutter]')}>
            <table className="min-w-full divide-y divide-gray-300 text-left text-sm/6 text-zinc-950 dark:text-white">{children}</table>
          </div>
        </div>
      </div>
    </TableContext.Provider>
  )
}

export function ComposableTableHead({ className, ...props }: React.ComponentPropsWithoutRef<'thead'>) {
  return <thead {...props} className={clsx(className)} />
}

export function ComposableTableBody(props: React.ComponentPropsWithoutRef<'tbody'>) {
  return <tbody {...props} className="divide-y divide-gray-200 bg-white dark:bg-zinc-950" />
}

const TableRowContext = createContext<{ href?: string; target?: string; title?: string }>({
  href: undefined,
  target: undefined,
  title: undefined,
})

export function ComposableTableRow({
  href,
  target,
  title,
  hasOnClick = false,
  className,
  ...props
}: { href?: string; target?: string; title?: string; hasOnClick?: boolean } & React.ComponentPropsWithoutRef<'tr'>) {
  const { striped } = useContext(TableContext)

  return (
    <TableRowContext.Provider value={{ href, target, title } as React.ContextType<typeof TableRowContext>}>
      <tr
        {...props}
        className={clsx(
          className,
          hasOnClick &&
            'has-[[data-row-link][data-focus]]:outline-2 has-[[data-row-link][data-focus]]:-outline-offset-2 has-[[data-row-link][data-focus]]:outline-blue-500 dark:focus-within:bg-white/2.5',
          striped && 'even:bg-zinc-950/2.5 dark:even:bg-white/2.5',
          hasOnClick && striped && 'hover:bg-zinc-950/5 dark:hover:bg-white/5',
          hasOnClick && !striped && 'hover:bg-zinc-950/2.5 dark:hover:bg-white/2.5'
        )}
      />
    </TableRowContext.Provider>
  )
}

export function ComposableTableHeader({ 
  className, 
  sortKey, 
  children,
  mobileVisibility = 'always',
  isFirstHeader = false,
  ...props 
}: React.ComponentPropsWithoutRef<'th'> & { 
  sortable?: boolean; 
  sortKey?: any;
  mobileVisibility?: 'always' | 'sm' | 'lg' | 'never';
  isFirstHeader?: boolean;
}) {
  const { grid, sortBy, sortDirection, onSort } = useContext(TableContext)

  const handleSort = () => {
    if (!sortKey || !onSort) return
    
    let newDirection: 'asc' | 'desc' | null = 'asc'
    if (sortBy === sortKey && sortDirection === 'asc') {
      newDirection = 'desc'
    } else if (sortBy === sortKey && sortDirection === 'desc') {
      sortKey = null;
      newDirection = null;
    }
    
    onSort(sortKey, newDirection)
  }

  const isActive = sortBy === sortKey
  const showUpArrow = sortKey && isActive && sortDirection === 'asc'
  const showDownArrow = sortKey && isActive && sortDirection === 'desc'

  // Determine visibility classes based on mobileVisibility
  const visibilityClass = mobileVisibility === 'always' 
    ? '' 
    : mobileVisibility === 'sm' 
    ? 'hidden sm:table-cell' 
    : mobileVisibility === 'lg'
    ? 'hidden lg:table-cell'
    : mobileVisibility === 'never'
    ? 'hidden sm:table-cell'
    : ''

  return (
    <th
      {...props}
      scope="col"
      className={clsx(
        className,
        visibilityClass,
        'sticky top-0 z-1 bg-white shadow-sm',
        'bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/75 dark:bg-zinc-950/95 dark:supports-backdrop-filter:bg-zinc-950/75',
        'py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white',
        isFirstHeader ? 'pr-3 pl-4 sm:pl-0' : 'px-3',
        grid && 'border-l border-l-zinc-950/5 first:border-l-0 dark:border-l-white/5',
        sortKey && 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
      )}
      onClick={handleSort}
    >
      <div className="flex items-center justify-between gap-2">
        <span>{children}</span>
        {showUpArrow && (
            <ArrowUpIcon 
              size={12}
            />
        )}
        {showDownArrow && (
            <ArrowDownIcon
              size={12}
            />
        )}
      </div>
    </th>
  )
}

export function ComposableTableCell({ 
  className, 
  children,
  mobileVisibility = 'always',
  isFirstCell = false,
  ...props 
}: React.ComponentPropsWithoutRef<'td'> & {
  mobileVisibility?: 'always' | 'sm' | 'lg' | 'never';
  isFirstCell?: boolean;
}) {
  const { grid } = useContext(TableContext)
  const { href, target, title } = useContext(TableRowContext)
  const [cellRef, setCellRef] = useState<HTMLElement | null>(null)

  // Determine visibility classes based on mobileVisibility
  const visibilityClass = mobileVisibility === 'always' 
    ? '' 
    : mobileVisibility === 'sm' 
    ? 'hidden sm:table-cell' 
    : mobileVisibility === 'lg'
    ? 'hidden lg:table-cell'
    : mobileVisibility === 'never'
    ? 'hidden sm:table-cell'
    : ''

  return (
    <td
      ref={href ? setCellRef : undefined}
      {...props}
      className={clsx(
        className,
        visibilityClass,
        'relative py-4 text-sm',
        isFirstCell && 'w-full max-w-0 py-4 pr-3 pl-4 text-sm font-medium text-gray-900 dark:text-white sm:w-auto sm:max-w-none sm:pl-0',
        !isFirstCell && 'px-3 text-gray-500 dark:text-gray-400',
        grid && 'border-l border-l-zinc-950/5 first:border-l-0 dark:border-l-white/5'
      )}
    >
      {href && (
        <Link
          data-row-link
          to={href}
          target={target}
          aria-label={title}
          tabIndex={cellRef?.previousElementSibling === null ? 0 : -1}
          className="absolute inset-0 focus:outline-none"
        />
      )}
      {children}
    </td>
  )
}
