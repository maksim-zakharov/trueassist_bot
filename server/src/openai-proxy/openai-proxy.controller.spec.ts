import { Test, TestingModule } from '@nestjs/testing';
import { OpenaiProxyController } from './openai-proxy.controller';

describe('OpenaiProxyController', () => {
  let controller: OpenaiProxyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenaiProxyController],
    }).compile();

    controller = module.get<OpenaiProxyController>(OpenaiProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
