import clsx from 'clsx'
import type React from 'react'
import { createContext, type ReactNode, useContext, useRef, useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useRemainingHeight } from '~/hooks/use-remaining-height'
import { ArrowDownIcon, ArrowUpIcon } from '~/components/icons'

export interface TableCell<T> {
  renderCell: (prop: T) => ReactNode
  headerLabel: string
  className?: string
  sortKey?: keyof T
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

  return (
    <>
      <ComposableTable striped={striped} dense={dense} bleed={bleed} rows={rows} isLoading={isLoading} isContentHeight={isContentHeight} sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort}>
        <ComposableTableHead>
          <ComposableTableRow>
            {cells.map((cell: TableCell<T>, i: number) => (
              <ComposableTableHeader className={cell.className} key={`table-header-${i}`} sortKey={cell.sortKey}>
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
              {cells.map(({ renderCell, className }: TableCell<T>, cellIndex: number) => {
                return (
                  <ComposableTableCell key={`table-cell-${cellIndex}`} className={className}>
                    {isSkeletonRow(row) ? (
                      <SkeletonCell />
                    ) : (
                      renderCell(row)
                    )}
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
        <div ref={componentRef} {...props} style={{ height: isContentHeight ? 'auto' : height }} className={clsx(className, '-mx-[--gutter] whitespace-nowrap overflow-x-auto')}>
          <div className={clsx('inline-block w-32 sm:min-w-full align-middle', !bleed && 'sm:px-[--gutter]')}>
            <table className="min-w-full text-left text-sm/6 text-zinc-950 dark:text-white">{children}</table>
          </div>
        </div>
      </div>
    </TableContext.Provider>
  )
}

export function ComposableTableHead({ className, ...props }: React.ComponentPropsWithoutRef<'thead'>) {
  return <thead {...props} className={clsx(className, 'text-zinc-500 dark:text-zinc-400')} />
}

export function ComposableTableBody(props: React.ComponentPropsWithoutRef<'tbody'>) {
  return <tbody {...props} />
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
  ...props 
}: React.ComponentPropsWithoutRef<'th'> & { 
  sortable?: boolean; 
  sortKey?: any; 
}) {
  const { bleed, grid, sortBy, sortDirection, onSort } = useContext(TableContext)

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

  return (
    <th
      {...props}
      className={clsx(
        className,
        'sticky top-0 z-1 bg-white shadow-sm',
        'bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/75 dark:bg-zinc-950/95 dark:supports-backdrop-filter:bg-zinc-950/75',
        'border-b border-b-zinc-950/10 px-4 py-2 font-medium first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2)) dark:border-b-white/10',
        grid && 'border-l border-l-zinc-950/5 first:border-l-0 dark:border-l-white/5',
        !bleed && 'sm:first:pl-1 sm:last:pr-1',
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

export function ComposableTableCell({ className, children, ...props }: React.ComponentPropsWithoutRef<'td'>) {
  const { bleed, dense, grid, striped } = useContext(TableContext)
  const { href, target, title } = useContext(TableRowContext)
  const [cellRef, setCellRef] = useState<HTMLElement | null>(null)

  return (
    <td
      ref={href ? setCellRef : undefined}
      {...props}
      className={clsx(
        className,
        'relative px-4 first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2))',
        !striped && 'border-b border-zinc-950/5 dark:border-b-white/5',
        grid && 'border-l border-l-zinc-950/5 first:border-l-0 dark:border-l-white/5',
        dense ? 'py-2.5' : 'py-4',
        !bleed && 'sm:first:pl-1 sm:last:pr-1'
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
