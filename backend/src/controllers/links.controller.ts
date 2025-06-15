import { Request, Response } from 'express';
import * as linksService from '../services/links.service';
import { LinkData } from '../services/links.service';

export const getLinksController = async (req: Request, res: Response): Promise<void> => {
  try {
    const links = await linksService.getLinks();
    if (!links) {
      res.status(404).json({ message: 'Links not found.' });
    } else {
      res.status(200).json(links);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching links', error });
  }
};

export const upsertLinksController = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingLinks = await linksService.getLinks();
    const payload: LinkData = req.body;

    const result = await linksService.upsertLinks(payload, existingLinks);
    const statusCode = existingLinks ? 200 : 201;
    res.status(statusCode).json(result);

  } catch (error: any) {
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
      res.status(500).json({ message: 'Error deleting links', error: error.message });
    }
  }
};