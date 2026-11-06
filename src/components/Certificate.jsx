import React, { useState } from "react";
import { Modal, IconButton, Box, Backdrop, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { FileText, Download, ExternalLink, Award } from "lucide-react";

export const isPdfUrl = (url) => {
	if (!url || typeof url !== "string") return false;
	const cleanUrl = url.split("?")[0].toLowerCase();
	return cleanUrl.endsWith(".pdf") || url.startsWith("data:application/pdf");
};

const Certificate = ({ ImgSertif }) => {
	const [open, setOpen] = useState(false);
	const isPdf = isPdfUrl(ImgSertif);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<Box component="div" sx={{ width: "100%" }}>
			{/* Thumbnail Container */}
			<Box
				sx={{
					position: "relative",
					overflow: "hidden",
					borderRadius: 3,
					border: "1px solid #D8CFBE",
					backgroundColor: "#FFFFFF",
					boxShadow: "0 8px 24px rgba(30,59,47,0.06)",
					transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
					"&:hover": {
						transform: "translateY(-4px)",
						borderColor: "#7F8C6A",
						boxShadow: "0 12px 28px rgba(30,59,47,0.12)",
						"& .overlay": {
							opacity: 1,
						},
						"& .hover-content": {
							transform: "translate(-50%, -50%)",
							opacity: 1,
						},
						"& .certificate-image": {
							filter: "contrast(1.05) brightness(1) saturate(1.1)",
						},
					},
				}}
			>
				{/* Content: PDF or Image */}
				{isPdf ? (
					<Box
						onClick={handleOpen}
						sx={{
							position: "relative",
							width: "100%",
							aspectRatio: "16/11.5",
							backgroundColor: "#F5F0E6",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							p: 3,
							cursor: "pointer",
						}}
					>
						<div className="w-14 h-14 rounded-2xl bg-[#1E3B2F] text-[#F5F0E6] flex items-center justify-center shadow-xs mb-2 transition-transform duration-300">
							<FileText className="w-7 h-7 text-[#C8B48A]" />
						</div>
						<span className="text-xs font-mono font-bold text-[#1E3B2F] uppercase tracking-wider text-center">
							PDF Certificate
						</span>
						<span className="text-[11px] text-[#5A6650] font-mono mt-1 text-center truncate max-w-full px-2">
							Klik untuk Pratinjau Dokumen
						</span>

						{/* PDF Badge */}
						<div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#1E3B2F] text-[#F5F0E6] text-[10px] font-mono font-semibold flex items-center gap-1 shadow-2xs">
							<Award className="w-3 h-3 text-[#C8B48A]" />
							<span>PDF</span>
						</div>
					</Box>
				) : (
					<Box
						sx={{
							position: "relative",
							"&::before": {
								content: '""',
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								backgroundColor: "rgba(0, 0, 0, 0.05)",
								zIndex: 1,
							},
						}}
					>
						<img
							className="certificate-image"
							src={ImgSertif}
							alt="Certificate"
							style={{
								width: "100%",
								height: "auto",
								display: "block",
								objectFit: "cover",
								filter: "contrast(1.05) brightness(0.95)",
								transition: "filter 0.3s ease",
								aspectRatio: "16/11.5",
							}}
							onClick={handleOpen}
						/>
					</Box>
				)}

				{/* Hover Overlay */}
				<Box
					className="overlay"
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						opacity: 0,
						backgroundColor: "rgba(30, 59, 47, 0.4)",
						backdropFilter: "blur(2px)",
						transition: "all 0.3s ease",
						cursor: "pointer",
						zIndex: 2,
					}}
					onClick={handleOpen}
				>
					<Box
						className="hover-content"
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -60%)",
							opacity: 0,
							transition: "all 0.4s ease",
							textAlign: "center",
							width: "100%",
							color: "white",
						}}
					>
						<FullscreenIcon
							sx={{
								fontSize: 36,
								mb: 0.5,
								filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
							}}
						/>
						<Typography
							variant="subtitle2"
							sx={{
								fontWeight: 600,
								fontFamily: "monospace",
								textShadow: "0 2px 4px rgba(0,0,0,0.4)",
							}}
						>
							{isPdf ? "Buka Dokumen PDF" : "Lihat Sertifikat"}
						</Typography>
					</Box>
				</Box>
			</Box>

			{/* Modal Viewer */}
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="certificate-modal-title"
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 300,
					sx: {
						backgroundColor: "rgba(0, 0, 0, 0.85)",
						backdropFilter: "blur(6px)",
					},
				}}
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					p: 2,
				}}
			>
				{isPdf ? (
					/* PDF Modal Viewer */
					<Box
						sx={{
							position: "relative",
							width: { xs: "96vw", sm: "90vw", md: "80vw" },
							height: { xs: "90vh", sm: "88vh" },
							maxWidth: "1100px",
							backgroundColor: "#FFFFFF",
							borderRadius: 3,
							overflow: "hidden",
							display: "flex",
							flexDirection: "column",
							boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
							outline: "none",
						}}
					>
						{/* Header Bar */}
						<div className="flex items-center justify-between px-4 py-3 bg-[#1E3B2F] text-[#F5F0E6] shrink-0 border-b border-[#D8CFBE]">
							<div className="flex items-center gap-2.5 min-w-0">
								<div className="p-1.5 rounded-lg bg-[#FFFFFF]/10 text-[#C8B48A]">
									<FileText className="w-4 h-4" />
								</div>
								<span className="text-xs sm:text-sm font-mono font-bold truncate">
									Pratinjau Sertifikat (PDF)
								</span>
							</div>

							<div className="flex items-center gap-2 shrink-0">
								<a
									href={ImgSertif}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F0E6] text-[#1E3B2F] text-xs font-mono font-semibold hover:bg-[#EDE7DA] transition-all shadow-xs"
								>
									<ExternalLink className="w-3.5 h-3.5" />
									<span className="hidden sm:inline">Buka Tab Baru</span>
								</a>

								<a
									href={ImgSertif}
									download="Sertifikat.pdf"
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7F8C6A] text-[#F5F0E6] text-xs font-mono font-semibold hover:bg-[#6e7a5b] transition-all shadow-xs"
								>
									<Download className="w-3.5 h-3.5" />
									<span className="hidden sm:inline">Unduh PDF</span>
								</a>

								<button
									onClick={handleClose}
									className="p-1.5 rounded-lg text-[#F5F0E6]/80 hover:text-white hover:bg-white/10 transition-colors ml-1"
									title="Tutup"
								>
									<CloseIcon sx={{ fontSize: 20 }} />
								</button>
							</div>
						</div>

						{/* PDF Iframe Embed */}
						<div className="flex-1 w-full h-full bg-[#404040] relative overflow-hidden">
							<iframe
								src={`${ImgSertif}#toolbar=1&navpanes=0`}
								title="Certificate PDF Document"
								className="w-full h-full"
								style={{ border: "none" }}
							/>
						</div>
					</Box>
				) : (
					/* Image Modal Viewer */
					<Box
						sx={{
							position: "relative",
							width: "auto",
							maxWidth: "92vw",
							maxHeight: "90vh",
							outline: "none",
						}}
					>
						<IconButton
							onClick={handleClose}
							sx={{
								position: "absolute",
								right: 12,
								top: 12,
								color: "white",
								bgcolor: "rgba(0,0,0,0.6)",
								zIndex: 2,
								padding: 1,
								"&:hover": {
									bgcolor: "rgba(0,0,0,0.85)",
									transform: "scale(1.05)",
								},
							}}
							size="medium"
						>
							<CloseIcon sx={{ fontSize: 22 }} />
						</IconButton>

						<img
							src={ImgSertif}
							alt="Certificate Full View"
							style={{
								display: "block",
								maxWidth: "100%",
								maxHeight: "90vh",
								borderRadius: "12px",
								objectFit: "contain",
								boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
							}}
						/>
					</Box>
				)}
			</Modal>
		</Box>
	);
};

export default Certificate;
