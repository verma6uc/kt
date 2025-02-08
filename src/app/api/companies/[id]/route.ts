import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { handleCompanyDeactivation } from '@/lib/company-service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    const companyId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    // If status is being updated to inactive, handle deactivation
    if (data.status === 'inactive') {
      const deactivationResult = await handleCompanyDeactivation(
        companyId,
        userId
      )

      if (!deactivationResult.success) {
        return new NextResponse(deactivationResult.error || 'Failed to deactivate company', {
          status: 500
        })
      }

      // Update company status
      const company = await prisma.company.update({
        where: { id: companyId },
        data: { status: 'inactive' }
      })

      return NextResponse.json(company)
    }

    // Handle other updates normally
    const company = await prisma.company.update({
      where: { id: companyId },
      data
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to update company',
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const companyId = parseInt(params.id)
    const company = await prisma.company.delete({
      where: { id: companyId }
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error deleting company:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to delete company',
      { status: 500 }
    )
  }
}