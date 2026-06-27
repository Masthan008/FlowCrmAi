import { Request, Response, NextFunction } from 'express';
import { contactNoteService } from '../service/contactNote.service';
import { ResponseHelper } from '../../helpers/response';

export const contactNoteController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notes = await contactNoteService.getNotes(req.params.id as string, req.query.search as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Notes retrieved successfully.', notes);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await contactNoteService.createNote(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Note created successfully.', note);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await contactNoteService.updateNote(req.params.noteId as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Note updated successfully.', note);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await contactNoteService.deleteNote(req.params.noteId as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Note deleted successfully.');
    } catch (error) {
      next(error);
    }
  }
};

export default contactNoteController;
