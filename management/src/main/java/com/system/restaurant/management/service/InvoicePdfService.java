package com.system.restaurant.management.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.font.FontProvider;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.borders.Border;
import com.system.restaurant.management.entity.OrderDetail;
import com.system.restaurant.management.entity.PaymentRecord;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class InvoicePdfService {
    public byte[] generateInvoicePdf(Integer orderId,
                                     String customerName,
                                     List<OrderDetail> items,
                                     PaymentRecord pr,
                                     double discount,
                                     double total) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);

        Document doc = new Document(pdf);
        FontProvider fontProvider = new FontProvider();
        fontProvider.addSystemFonts();
        doc.setFontProvider(fontProvider);
        doc.setFontFamily("Arial");

        doc.add(new Paragraph("HÓA ĐƠN NHÀ HÀNG")
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
        );

        Table info = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                .useAllAvailableWidth();
        info.addCell(new Cell().setBorder(Border.NO_BORDER).add(new Paragraph("Mã đơn:")));
        info.addCell(new Cell().setBorder(Border.NO_BORDER).add(new Paragraph("#" + orderId)));
        info.addCell(new Cell().setBorder(Border.NO_BORDER).add(new Paragraph("Khách hàng:")));
        info.addCell(new Cell().setBorder(Border.NO_BORDER).add(new Paragraph(customerName)));
        info.addCell(new Cell().setBorder(Border.NO_BORDER).add(new Paragraph("Ngày:")));
        info.addCell(new Cell().setBorder(Border.NO_BORDER)
                .add(new Paragraph(pr.getPaidAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))));
        doc.add(info.setMarginBottom(15f));

        Table table = new Table(UnitValue.createPercentArray(new float[]{4,1,2}))
                .useAllAvailableWidth();
        table.addHeaderCell(new Cell().add(new Paragraph("Tên món")).setBold());
        table.addHeaderCell(new Cell().add(new Paragraph("SL")).setBold());
        table.addHeaderCell(new Cell().add(new Paragraph("Thành tiền")).setBold());
        for (OrderDetail d : items) {
            table.addCell(new Cell().add(new Paragraph(d.getDishName())));
            table.addCell(new Cell().add(new Paragraph(String.valueOf(d.getQuantity()))));
            table.addCell(new Cell().add(new Paragraph(
                    String.format("%,.0f₫", d.getQuantity() * d.getUnitPrice().doubleValue())
            )));
        }
        table.addCell(new Cell(1,2).add(new Paragraph("Chiết khấu")).setTextAlignment(TextAlignment.RIGHT));
        table.addCell(new Cell().add(new Paragraph(String.format("-%,.0f₫", discount))));
        // Footer: Tổng cộng
        table.addCell(new Cell(1,2).add(new Paragraph("Tổng cộng").setBold()).setTextAlignment(TextAlignment.RIGHT));
        table.addCell(new Cell().add(new Paragraph(String.format("%,.0f₫", total))).setBold());
        doc.add(table);

        doc.add(new Paragraph("\n"));
        doc.add(new Paragraph("Cảm ơn quý khách!")
                .setTextAlignment(TextAlignment.CENTER)
        );

        doc.close();
        return baos.toByteArray();
    }
}
