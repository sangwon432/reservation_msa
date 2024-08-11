import { AbstractDocument } from './abstract.schema';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { Logger, NotFoundException } from '@nestjs/common';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected readonly logger: Logger;

  constructor(protected readonly model: Model<TDocument>) {
    this.logger = new Logger(model.modelName);
  }

  //MONGODB 생성 로직
  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    const createDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });

    const savedDocument = await createDocument.save();
    return savedDocument.toJSON() as unknown as TDocument;
  }

  // MONGODB 전체 정보 불러오는 로직
  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    const documents = (await this.model
      .find(filterQuery)
      .lean(true)) as TDocument[];
    return documents;
  }

  //MONGODB 상세 정보 불러오는 로직
  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = (await this.model
      .findOne(filterQuery)
      .lean(true)) as TDocument;

    if (!document) {
      this.logger.warn(
        `Document not found with filter query: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('The document was not found');
    }
    return document;
  }

  // MONGODB 상세정보 수정하는 로직
  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      new: true,
    });
    if (!document) {
      this.logger.warn(
        `Document not found with filter query ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('The document was not found');
    }
    return document;
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    const document = (await this.model
      .findOneAndDelete(filterQuery)
      .lean(true)) as TDocument;

    if (!document) {
      this.logger.warn(
        `Document not found with filter query: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('The document was not found');
    }
    return document;
  }
}
