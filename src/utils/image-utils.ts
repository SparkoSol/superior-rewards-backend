import * as fs from 'fs';
import * as path from 'path';
import { FileSchema } from '../uploadFileStructue/file.schema';

export class ImageUtils {
    static imagePath = path.join(process.cwd(), '..', 'superior-rewards-uploads');

    static deleteImages(deletedImages: any, fromPathList: boolean): void {
        try {
            if (fromPathList) {
                if (Array.isArray(deletedImages)) {
                    for (const delImg of deletedImages) {
                        fs.unlinkSync(delImg.toString());
                    }
                } else {
                    fs.unlinkSync(deletedImages.toString());
                }
            } else {
                if (Array.isArray(deletedImages)) {
                    for (const image of deletedImages) {
                        fs.unlinkSync(image.path.toString());
                    }
                } else fs.unlinkSync((deletedImages as FileSchema).path.toString());
            }
        } catch (e) {
            //ignore
        }
    }
}
