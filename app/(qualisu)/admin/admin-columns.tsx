'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { UserRole, Departments, type UserGroups } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AdminActions } from './admin-actions'

export type UserColumn = {
  id: string
  name: string | null
  email: string | null
  emailVerified: Date | null
  role: UserRole
  dept: Departments
}

export const columns: ColumnDef<UserColumn>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div>{row.original.email}</div>
    }
  },
  {
    accessorKey: 'emailVerified',
    header: 'Email Verified',
    cell: ({ row }) => {
      const isVerified = row.original.emailVerified
      return (
        <Badge variant={isVerified ? 'success' : 'destructive'}>
          {isVerified ? 'Verified' : 'Not Verified'}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'role',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div>{row.original.role}</div>
    }
  },
  {
    accessorKey: 'dept',
    header: 'Department'
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => (
      <AdminActions
        user={row.original}
        userGroups={
          (table.options.meta as { userGroups: UserGroups[] }).userGroups
        }
      />
    )
  }
]
