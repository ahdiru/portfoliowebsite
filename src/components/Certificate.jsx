import React, { useState, useEffect } from "react";
import { Modal, IconButton, Box, Backdrop, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { Download, ExternalLink, Award } from "lucide-react";
import { convertPdfFirstPageToImage } from "../utils/pdfToImage";

export const isPdfUrl = (url) => {
	if (!url || typeof url !== "string") return false;
	const cleanUrl = url.split("?")[0].toLowerCase();
	return cleanUrl.endsWith(".pdf") || url.startsWith("data:application/pdf");
};

const Certificate = ({ ImgSertif, pdfUrl }) => {
	const [open, setOpen] = useState(false);
	const [renderedImg, setRenderedImg] = useState(null);
	const [converting, setConverting] = useState(false);
	const isPdf = isPdfUrl(ImgSertif);
	const actualPdfUrl = pdfUrl || (isPdf ? ImgSertif : null);

	useEffect(() => {
		let isMounted = true;

		if (isPdf) {
			setConverting(true);
			convertPdfFirstPageToImage(ImgSertif, 2.5)
				.then((imgData) => {
					if (isMounted) {
						setRenderedImg(imgData);
						setConverting(false);
					}
				})
				.catch((err) => {
					console.warn("PDF to image render fallback:", err);
					if (isMounted) setConverting(false);
				});
		} else {
			setRenderedImg(ImgSertif);
		}

		return () => {
			isMounted = false;
		};
	}, [ImgSertif, isPdf]);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const displaySource = renderedImg || (!isPdf ? ImgSertif : null);

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
							filter: "contrast(1.05) brightness(1) saturate(1.05)",
						},
					},
				}}
			>
				{/* Certificate Clean Fullview Image (Zero PDF toolbars) */}
				<Box
					sx={{
						position: "relative",
						width: "100%",
						aspectRatio: "16/11.5",
						backgroundColor: "#EDE7DA",
						overflow: "hidden",
					}}
				>
					{displaySource ? (
						<img
							className="certificate-image"
							src={displaySource}
							alt="Certificate Full View"
							style={{
								width: "100%",
								height: "100%",
								display: "block",
								objectFit: "cover",
								filter: "contrast(1.02) brightness(0.98)",
								transition: "filter 0.3s ease",
							}}
							onClick={handleOpen}
						/>
					) : (
						<div className="w-full h-full flex flex-col items-center justify-center bg-[#F5F0E6] p-4 text-center animate-pulse">
							<div className="w-10 h-10 rounded-xl bg-[#1E3B2F] text-[#F5F0E6] flex items-center justify-center mb-2 shadow-xs">
								<Award className="w-5 h-5 text-[#C8B48A]" />
							</div>
							<span className="text-xs font-mono font-bold text-[#1E3B2F]">
								{converting ? "Memuat Pratinjau..." : "Sertifikat"}
							</span>
						</div>
					)}

					{/* Subtle PDF Badge if from PDF */}
					{actualPdfUrl && (
						<div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#1E3B2F]/90 backdrop-blur-xs text-[#F5F0E6] text-[9px] font-mono font-bold flex items-center gap-1 shadow-xs pointer-events-none z-10">
							<Award className="w-2.5 h-2.5 text-[#C8B48A]" />
							<span>PDF</span>
						</div>
					)}
				</Box>

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
						backgroundColor: "rgba(30, 59, 47, 0.45)",
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
								fontSize: 38,
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
							Lihat Sertifikat Penuh
						</Typography>
					</Box>
				</Box>
			</Box>

			{/* Fullscreen Modal View (Fullview without toolbars) */}
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="certificate-modal-title"
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 300,
					sx: {
						backgroundColor: "rgba(0, 0, 0, 0.88)",
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
				<Box
					sx={{
						position: "relative",
						width: "auto",
						maxWidth: "94vw",
						maxHeight: "92vh",
						outline: "none",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					{/* Close & Action Header */}
					<div className="w-full flex items-center justify-between pb-3 gap-2">
						{actualPdfUrl ? (
							<div className="flex items-center gap-2">
								<a
									href={actualPdfUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F0E6] text-[#1E3B2F] text-xs font-mono font-semibold hover:bg-[#EDE7DA] transition-all shadow-xs"
								>
									<ExternalLink className="w-3.5 h-3.5 text-[#7F8C6A]" />
									<span>Buka PDF Asli</span>
								</a>
								<a
									href={actualPdfUrl}
									download="Sertifikat.pdf"
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E3B2F] text-[#F5F0E6] text-xs font-mono font-semibold hover:bg-[#2A5241] transition-all shadow-xs"
								>
									<Download className="w-3.5 h-3.5 text-[#C8B48A]" />
									<span>Unduh PDF</span>
								</a>
							</div>
						) : <div />}

						<IconButton
							onClick={handleClose}
							sx={{
								color: "white",
								bgcolor: "rgba(0,0,0,0.6)",
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
					</div>

					{/* Clean Fullview Certificate Image (Zero toolbars) */}
					<img
						src={displaySource}
						alt="Certificate Full View"
						style={{
							display: "block",
							maxWidth: "94vw",
							maxHeight: "82vh",
							borderRadius: "14px",
							objectFit: "contain",
							boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
							backgroundColor: "#FFFFFF",
						}}
					/>
				</Box>
			</Modal>
		</Box>
	);
};

export default Certificate;
