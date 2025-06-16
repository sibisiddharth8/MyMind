import { Request, Response } from 'express';
import * as memberService from '../services/member.service';
import { MemberData } from '../services/member.service';
import fs from 'fs';
import path from 'path';

const deleteFile = (filePath: string | null | undefined) => {
  if (!filePath) return;
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

export const createMemberController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, linkedinLink, githubLink } = req.body;
        if (!name) {
            res.status(400).json({ message: "Member name is a required field." });
            return;
        }

        const payload: MemberData = { name, linkedinLink, githubLink };

        if (req.file) {
            payload.profileImage = req.file.path.replace(/\\/g, "/");
        }
        
        const member = await memberService.createMember(payload);
        res.status(201).json({ message: "Member created successfully.", data: member });
    } catch (error) {
        res.status(500).json({ message: "Error creating member.", error });
    }
};

export const getAllMembersController = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const name = req.query.name as string | undefined;

        const result = await memberService.getAllMembers({ page, limit, name });
        res.status(200).json({ message: "Members retrieved successfully.", ...result });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving members.", error });
    }
};

export const updateMemberController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const payload: MemberData = {};

        // Add text fields to payload if they exist in the request
        if (req.body.name) payload.name = req.body.name;
        if (req.body.linkedinLink !== undefined) payload.linkedinLink = req.body.linkedinLink;
        if (req.body.githubLink !== undefined) payload.githubLink = req.body.githubLink;

        // Handle file update
        if (req.file) {
            const oldMember = await memberService.getMemberById(id);
            deleteFile(oldMember?.profileImage); // Delete the old image
            payload.profileImage = req.file.path.replace(/\\/g, "/");
        }

        if (Object.keys(payload).length === 0) {
            res.status(400).json({ message: "No update data provided." });
            return;
        }

        const member = await memberService.updateMember(id, payload);
        res.status(200).json({ message: "Member updated successfully.", data: member });
    } catch (error) {
        res.status(500).json({ message: "Error updating member.", error });
    }
};

export const deleteMemberController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const member = await memberService.getMemberById(id);
        
        if (member) {
            deleteFile(member.profileImage); // Delete profile image when deleting member
            await memberService.deleteMember(id);
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Member not found." });
        }
    } catch (error: any) {
        if (error.code === 'P2003') { // Prisma foreign key constraint fail
             res.status(400).json({ message: "Cannot delete member. They are still part of a project.", details: "Please remove them from all projects before deleting." });
        } else {
            res.status(500).json({ message: "Error deleting member.", error });
        }
    }
};