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
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.kernel.colors.ColorConstants;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.function.BiFunction;

@Service
public class InvoicePdfService {

    public byte[] generateInvoicePdf(Integer orderId,
                                     String customerName,
                                     Integer tableNumber,
                                     String cashierName,
                                     List<OrderDetail> items,
                                     PaymentRecord pr,
                                     double discount,
                                     double total) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document doc = new Document(pdf);

        // Font
        FontProvider fontProvider = new FontProvider();
        fontProvider.addSystemFonts();
        doc.setFontProvider(fontProvider);
        doc.setFontFamily("Arial");

        // 1. Tên nhà hàng, địa chỉ, điện thoại (giữa)
        Paragraph header = new Paragraph()
                .add("NHÀ HÀNG ABC\n")
                .add("Địa chỉ: Đại học FPT, Hòa Lạc\n")
                .add("ĐT: 0372698544")
                .setFontSize(14)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER);
        doc.add(header);

        // 2. Tiêu đề và số hóa đơn (giữa)
        doc.add(new Paragraph("HÓA ĐƠN")
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(10f)
        );
        doc.add(new Paragraph("Số: " + orderId)
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(15f)
        );

        // 3. Thông tin bàn và thu ngân (rút gọn khoảng cách)
        Table info = new Table(UnitValue.createPercentArray(new float[]{1, 3}))
                .useAllAvailableWidth()
                .setMarginBottom(15f);

// helper để tạo cell với padding nhỏ
        BiFunction<String, Float, Cell> cell = (text, fontSize) -> new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(1f)                      // chỉ padding 2pt
                .add(new Paragraph(text).setFontSize(fontSize));

// Label và value dùng font size 12
        info.addCell(cell.apply("Ngày:", 12f));
        info.addCell(cell.apply(pr.getPaidAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")), 12f));
        info.addCell(cell.apply("Bàn:", 12f));
        info.addCell(cell.apply(String.valueOf(tableNumber), 12f));
        info.addCell(cell.apply("Thu ngân:", 12f));
        info.addCell(cell.apply(cashierName, 12f));
        info.addCell(cell.apply("Khách hàng:", 12f));
        info.addCell(cell.apply(customerName, 12f));
        doc.add(info);

        // 4. Bảng chi tiết món với STT, Tên món, Đơn giá, SL, Thành tiền
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 4, 2, 1, 2}))
                .useAllAvailableWidth();
        table.addHeaderCell(new Cell().add(new Paragraph("STT")).setBold());
        table.addHeaderCell(new Cell().add(new Paragraph("Tên món")).setBold());
        table.addHeaderCell(new Cell().add(new Paragraph("Đơn giá")).setBold());
        table.addHeaderCell(new Cell().add(new Paragraph("SL")).setBold());
        table.addHeaderCell(new Cell().add(new Paragraph("Thành tiền")).setBold());

        int index = 1;
        for (OrderDetail d : items) {
            double lineTotal = d.getUnitPrice().doubleValue() * d.getQuantity();
            table.addCell(new Cell().add(new Paragraph(String.valueOf(index++))));
            table.addCell(new Cell().add(new Paragraph(d.getDishName())));
            table.addCell(new Cell().add(new Paragraph(String.format("%,.0f₫", d.getUnitPrice().doubleValue()))));
            table.addCell(new Cell().add(new Paragraph(String.valueOf(d.getQuantity()))));
            table.addCell(new Cell().add(new Paragraph(String.format("%,.0f₫", lineTotal))));
        }
        doc.add(table.setMarginBottom(15f));


// 5. Bảng tổng hợp: Tổng tiền → Chiết khấu → Tiền thanh toán
        double subTotal = total + discount;  // tính lại tổng tiền gốc
// Chuẩn bị border ngang mỏng màu xám
        float lineWidth = 0.5f;
        SolidBorder horizontalLine = new SolidBorder(ColorConstants.LIGHT_GRAY, lineWidth);

        Table summary = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                .useAllAvailableWidth();

// --- HÀNG Tổng tiền ---
        Cell cell1 = new Cell()
                .add(new Paragraph("Tổng tiền").setFontSize(14))
                .setBorder(Border.NO_BORDER)
                .setBorderBottom(horizontalLine)       // vẽ đường dưới
                .setTextAlignment(TextAlignment.LEFT);
        Cell cell2 = new Cell()
                .add(new Paragraph(String.format("%,.0f₫", subTotal)).setFontSize(14))
                .setBorder(Border.NO_BORDER)
                .setBorderBottom(horizontalLine)
                .setTextAlignment(TextAlignment.LEFT);
        summary.addCell(cell1);
        summary.addCell(cell2);

// --- HÀNG Chiết khấu ---
        Cell cell3 = new Cell()
                .add(new Paragraph("Chiết khấu").setFontSize(14).setItalic())
                .setBorder(Border.NO_BORDER)
                .setBorderBottom(horizontalLine)
                .setTextAlignment(TextAlignment.LEFT);
        Cell cell4 = new Cell()
                .add(new Paragraph(String.format("-%,.0f₫", discount)).setFontSize(14).setItalic())
                .setBorder(Border.NO_BORDER)
                .setBorderBottom(horizontalLine)
                .setTextAlignment(TextAlignment.LEFT);
        summary.addCell(cell3);
        summary.addCell(cell4);

// --- HÀNG Tiền thanh toán ---
        Cell cell5 = new Cell()
                .add(new Paragraph("Tiền thanh toán").setFontSize(16).setBold())
                .setBorder(Border.NO_BORDER)
                // không cần line dưới nếu đây là dòng cuối, hoặc có thể giữ consistency
                .setBorderBottom(horizontalLine)
                .setTextAlignment(TextAlignment.LEFT);
        Cell cell6 = new Cell()
                .add(new Paragraph(String.format("%,.0f₫", total)).setFontSize(16).setBold())
                .setBorder(Border.NO_BORDER)
                .setBorderBottom(horizontalLine)
                .setTextAlignment(TextAlignment.LEFT);
        summary.addCell(cell5);
        summary.addCell(cell6);

        doc.add(summary);

        // Kết thúc
        doc.add(new Paragraph("\n"));
        doc.add(new Paragraph("Cảm ơn quý khách!")
                .setTextAlignment(TextAlignment.CENTER)
        );

        doc.close();
        return baos.toByteArray();
    }
}
