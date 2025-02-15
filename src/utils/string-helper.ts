import {
    camelCase
  } from "change-case";

  
export function sanitizePropertyName(name: string): string {
    return camelCase(name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_'));
}


export function normalizeSpaces(dateStr) {
    // Replace multiple spaces with a single space and trim
    return dateStr.replace(/\s+/g, ' ').trim();
}



export function parseTeamString(str: string): { rank: number | null; team: string } {
 // Regular expressions to match both formats
 const rankBeforeRegex = /^\((\d+\.)\)\s*(.+)$/;  // matches "(11.) Bari"
 const rankAfterRegex = /^(.+)\s*\((\d+\.)\)$/;   // matches "Hellas Verona (10.)"
 
 // Try matching rank before team name
 let match = str.match(rankBeforeRegex);
 if (match) {
     return {
         rank: parseInt(match[1]),
         team: match[2].trim()
     };
 }
 
 // Try matching rank after team name
 match = str.match(rankAfterRegex);
 if (match) {
     return {
         rank: parseInt(match[2]),
         team: match[1].trim()
     };
 }
 
 // If no rank is found, return team name with null rank
 return {
     rank: null,
     team: str.trim()
 };
  }
  

  