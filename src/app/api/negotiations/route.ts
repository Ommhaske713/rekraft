import { NextResponse } from 'next/server';
import { NegotiationModel } from '@/model/order.model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (data.customerId !== session.user.id) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    const negotiation = await NegotiationModel.createNegotiation(data);
    return NextResponse.json(negotiation);
  } catch (error) {
    console.error('Error creating negotiation:', error);
    return NextResponse.json({ error: 'Failed to create negotiation' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const customerId = url.searchParams.get('customerId');
    const sellerId = url.searchParams.get('sellerId');
    
    let negotiations;
    if (productId) {
      negotiations = await NegotiationModel.getProductNegotiations(productId);
    } else if (customerId) {
      if (customerId === session.user.id) {
        negotiations = await NegotiationModel.getCustomerNegotiations(customerId);
      } else {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else if (sellerId) {
      if (sellerId === session.user.id) {
        negotiations = await NegotiationModel.getSellerNegotiations(sellerId);
      } else {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Missing filter parameters' }, { status: 400 });
    }
    
    return NextResponse.json(negotiations);
  } catch (error) {
    console.error('Error fetching negotiations:', error);
    return NextResponse.json({ error: 'Failed to fetch negotiations' }, { status: 500 });
  }
}