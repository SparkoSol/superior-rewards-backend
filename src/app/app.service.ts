import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { extname } from 'path';
import { Bucket } from '@google-cloud/storage';
import { AuthService } from '../modules/auth/auth.service';
import * as admin from 'firebase-admin';
import { FirebaseError } from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { NoGeneratorUtils } from '../utils/no-generator-utils';
// @ts-ignore
import { File } from '@google-cloud/storage/build/cjs/src/file';

@Injectable()
export class AppService {
    private readonly storage: any;
    private readonly bucket: Bucket;
    private readonly defaultFolder = 'root';
    private readonly firebaseAdmin: admin.app.App;

    constructor(private readonly authService: AuthService) {
        this.firebaseAdmin = this.authService.getAdmin();
        this.storage = getStorage(this.firebaseAdmin);
        this.bucket = this.storage.bucket();
    }

    getHello(): string {
        return `Superior Gas reward backend is running...🎉🎉🎉, Port:[${process.env.APP_PORT}] & Environment:[${process.env.NODE_ENVIRONMENT}]`;
    }

    async uploadFile(
        file: Express.Multer.File,
        folder: string = this.defaultFolder
    ): Promise<File> {
        try {
            const fileName = `${await NoGeneratorUtils.generateCode(16)}${extname(file.originalname)}`;
            const fileRef = this.bucket.file(`${folder}/${fileName}`);

            await fileRef.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                },
            });

            return fileRef;
        } catch (error) {
            console.log('Error', (error as FirebaseError).message);
            throw new InternalServerErrorException('Error uploading file');
        }
    }

    async deleteFile(id: string): Promise<File> {
        try {
            const fileRef = this.bucket.file(id);
            await fileRef.delete();
            return fileRef;
        } catch (error) {
            if ((error as FirebaseError).code == '404') {
                throw new NotFoundException('File not found');
            } else {
                console.log('Error', (error as FirebaseError).message);
                throw new InternalServerErrorException('Error deleting file');
            }
        }
    }
}
