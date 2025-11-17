import {Body, Controller, Post, Req} from '@nestjs/common';
import {map} from "rxjs";
import {HttpService} from "@nestjs/axios";

@Controller('openai-proxy')
export class OpenaiProxyController {
    constructor(
        private readonly httpService: HttpService
    ) {
    }

    @Post('*')
    proxy(@Req() req: Request,
          @Body() body: any) {
        const url = req.url.replace('/openai-proxy', '');


        return this.httpService.post(
            `https://api.openai.com/v1${url}`,
            body,
            {
                headers: {
                    'Authorization': req.headers["authorization"],
                    'Content-Type': 'application/json'
                }
            }
        ).pipe(
            map(response => response.data)
        );
    }
}
