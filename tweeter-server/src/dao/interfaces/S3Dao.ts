export interface S3DAO {
  putImage(filename: string, imageStringBase64Encoded: string): Promise<string>;
  getImageUrl(userAlias: string): string;
}
