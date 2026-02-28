import { Injectable } from '@nestjs/common';

@Injectable()
export class MpesaProcessor {
  async createCheckout(reference: string): Promise<{ checkoutUrl: string }> {
    return { checkoutUrl: `/payments/confirmation?reference=${reference}&status=success` };
  }
}
