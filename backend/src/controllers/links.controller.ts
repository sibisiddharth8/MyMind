import { Request, Response } from 'express';
import * as linksService from '../services/links.service';
import { LinkData } from '../services/links.service';

export const getLinksController = async (req: Request, res: Response): Promise<void> => {
  try {
    const links = await linksService.getLinks();
    if (!links) {
      res.status(404).json({ message: 'No links found. Please create them.', data: null });
    } else {
      res.status(200).json({ message: 'Links retrieved successfully.', data: links });
    }
  } catch (error) {
    console.error("--- ERROR GETTING LINKS ---", error);
    res.status(500).json({ message: 'Error fetching links', error });
  }
};

export const upsertLinksController = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingLinks = await linksService.getLinks();
    const payload: LinkData = req.body;

    // To be absolutely safe, we ensure an 'id' field is never sent in the update payload,
    // as this can cause Prisma errors.
    if ('id' in payload) {
      delete payload.id;
    }

    const result = await linksService.upsertLinks(payload, existingLinks);
    const statusCode = existingLinks ? 200 : 201;
    res.status(statusCode).json({ message: 'Links updated successfully.', data: result});

  } catch (error: any) {
    // This detailed logging will show us the exact database error if one occurs.
    console.error("--- ERROR UPDATING LINKS ---", error);
    res.status(500).json({ message: 'Error processing links request', error: error.message });
  }
};

export const deleteLinksController = async (req: Request, res: Response): Promise<void> => {
  try {
    await linksService.deleteLinks();
    res.status(204).send();
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).json({ message: error.message });
    } else {
      console.error("--- ERROR DELETING LINKS ---", error);
      res.status(500).json({ message: 'Error deleting links', error: error.message });
    }
  }
};