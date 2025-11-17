import {Controller, Get, Param, Req, Res} from '@nestjs/common';
import axios from "axios";
import { Request } from 'express';

@Controller('')
export class SpaController {

    @Get('/')
    async getStatic(@Req() req: Request, @Res() res) {
        return this.proxyRequest('', req, res);
    }

    // Нужно для локального фронта
    @Get('/trueassist_bot/public/:path')
    async getPublic(@Param('path') path: string, @Req() req: Request, @Res() res) {
        return this.proxyRequest(`public/${path}`, req, res);
    }

    // Нужно для локального фронта
    @Get('/trueassist_bot/assets/:path')
    async getCSS(@Param('path') path: string, @Req() req: Request, @Res() res) {
        return this.proxyRequest(`assets/${path}`, req, res);
    }

    // Обязательно должно быть в конце
    @Get('*')
    async getSPARouting(@Req() req: Request, @Res() res) {
        let path = req.params[0];
        if (!path.includes('.') && !path.startsWith('api/')) {
            path = 'index.html';
        }
        return this.proxyRequest(path, req, res);
    }

    private buildProxyUrl(path: string, req: Request) {
        const baseUrl = 'https://maksim-zakharov.github.io/trueassist_bot/';
        const query = new URLSearchParams(req.query as Record<string, string>).toString();
        return `${baseUrl}${path}${query ? `?${query}` : ''}`;
    }

    private async proxyRequest(path: string, req: Request, res) {
        try {
            const url = this.buildProxyUrl(path, req);
            const response = await axios.get(url, { responseType: 'stream' });

            res.set({
                'content-type': response.headers['content-type'],
                'cache-control': response.headers['cache-control']
            });

            response.data.pipe(res);
        } catch (error) {
            console.log(error)
            res.status(500).send('Proxy error');
        }
    }
}
