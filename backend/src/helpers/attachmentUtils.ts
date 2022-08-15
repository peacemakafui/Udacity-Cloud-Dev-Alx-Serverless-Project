import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({ signatureVersion: 'v4'});
const bucket = process.env.ATTACHMENT_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export const getAttachmentUrl = (attachmentId:string): string => {
    return `https://${bucket}.s3.amazonaws.com/${attachmentId}`
}


export const getSignedUploadUrl = async (attachmentId:string):Promise<string> => {
    try{
        const signedUploadUrl = await s3.getSignedUrl('putObject',{
            Bucket: bucket,
            Key: attachmentId,
            Expires: Number(urlExpiration)
        })
        return signedUploadUrl;
    }catch(error){
        throw new Error(error)
    }
}