import { Injectable } from '@nestjs/common';

@Injectable()
export class StripeProcessor {
  async createCheckout(reference: string): Promise<{ checkoutUrl: string }> {
    return { checkoutUrl: `/payments/confirmation?reference=${reference}&status=success` };
  }
}
