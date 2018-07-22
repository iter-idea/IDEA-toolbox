/**
 * S3
 */

import AWS = require('aws-sdk');

import { Utils } from './utils';

const S3_DEFAULT_DOWNLOAD_BUCKET = 'idea-downloads';
const S3_DEFAULT_DOWNLOAD_BUCKET_PREFIX = 'common';
const S3_DEFAULT_DOWNLOAD_BUCKET_SEC_TO_EXP = 180;

export class S3 {
  protected s3: any;

  /**
   * @param {Utils} utils 
   */
  constructor(protected utils: Utils) {
    this.s3 = new AWS.S3({ apiVersion: '2006-03-01' });
  }

  /**
   * Download a file through an S3 signed url.
   * *Pratically*, it uploads the file on an S3 bucket (w/ automatic cleaning),
   * it generates a signed url, returning it.
   * @param {string} prefix a folder in which to put all the files of the same kind
   * @param {string} key the unique filepath
   * @param {any} dataToUpload usually a buffer
   * @param {string} contentType e.g. application/json
   * @param {string} bucket optional; an alternative Downloads bucket to the default one
   * @param {number} secToExp optional; seconds to url expiration
   * @return {Promise<string>}
   */
  public downloadThroughUrl(
    prefix: string, key: string, dataToUpload: any, contentType: string, 
    bucket?: string, secToExp?: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      key = `${prefix || S3_DEFAULT_DOWNLOAD_BUCKET_PREFIX}/${key}`;
      bucket = bucket || S3_DEFAULT_DOWNLOAD_BUCKET;
      secToExp = secToExp || S3_DEFAULT_DOWNLOAD_BUCKET_SEC_TO_EXP;
      this.s3.upload({ Bucket: bucket, Key: key, Body: dataToUpload, ContentType: contentType },
      (err: Error, data: any) => {
        this.utils.logger('S3 UPLOAD', err, data);
        if(err) reject(err);
        else resolve(this.s3.getSignedUrl('getObject', { Bucket: bucket, Key: key, Expires: secToExp }));
      });
    });
  }
}