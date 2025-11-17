import {Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards} from '@nestjs/common';
import {Address} from "@prisma/client";
import {AddressesService} from "./address.service";
import {AuthGuard} from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller('/api/addresses')
export class AddressesController {

    constructor(private readonly addressesService: AddressesService) {
    }

    @Get('')
    getAddresses(@Req() req) {
        return this.addressesService.getAll(req.user.id);
    }

    @Post('')
    addAddress(@Body() {id, ...body}: Address, @Req() req): any {
        return this.addressesService.create({...body, userId: req.user.id});
    }

    @Put('/:id')
    editAddress(@Param('id') id: number, @Body() body: any, @Req() req): any {
        return this.addressesService.update({...body, userId: req.user.id});
    }

    @Delete('/:id')
    deleteAddress(@Param('id') id: number): any {
        return this.addressesService.delete(Number(id));
    }
}
