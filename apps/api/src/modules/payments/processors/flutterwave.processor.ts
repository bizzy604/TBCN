import { Injectable } from '@nestjs/common';

@Injectable()
export class FlutterwaveProcessor {
  async createCheckout(reference: string): Promise<{ checkoutUrl: string }> {
    return { checkoutUrl: `/payments/confirmation?reference=${reference}&status=success` };
  }
}
