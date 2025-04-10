import { NextResponse } from 'next/server';
import { NegotiationModel } from '@/model/order.model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

interface RouteContext {
    params: Promise<{ id: string }>;
}

interface NegotiationDocument {
    customerId: string;
    sellerId: string;
    [key: string]: any;
}

interface UserSession {
    user?: {
        id: string;
        [key: string]: any;
    };
}

export async function GET(
    request: Request,
    context: RouteContext
): Promise<NextResponse> {
    try {
        const { id } = await context.params
        
        const session = await getServerSession(authOptions) as UserSession | null;
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const negotiation = await NegotiationModel.findById(id) as NegotiationDocument | null;
        if (!negotiation) {
            return NextResponse.json({ error: 'Negotiation not found' }, { status: 404 });
        }

        if (negotiation.customerId !== session.user.id && negotiation.sellerId !== session.user.id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json(negotiation);
    } catch (error) {
        console.error('Error fetching negotiation:', error);
        return NextResponse.json({ error: 'Failed to fetch negotiation' }, { status: 500 });
    }
}

interface NegotiationUpdateData {
    customerId?: string;
    sellerId?: string;
    [key: string]: any; 
}

export async function PATCH(
    request: Request,
    context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params
    
    const session = await getServerSession(authOptions) as UserSession | null;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const negotiation = await NegotiationModel.findById(id) as NegotiationDocument | null;
    if (!negotiation) {
      return NextResponse.json({ error: 'Negotiation not found' }, { status: 404 });
    }

    if (negotiation.customerId !== session.user.id && negotiation.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const data = await request.json() as NegotiationUpdateData;
    const updatedNegotiation = await NegotiationModel.updateNegotiation(id, data) as NegotiationDocument;

    return NextResponse.json(updatedNegotiation);
  } catch (error) {
    console.error('Error updating negotiation:', error);
    return NextResponse.json({ error: 'Failed to update negotiation' }, { status: 500 });
  }
}